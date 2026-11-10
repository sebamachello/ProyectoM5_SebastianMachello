import { describe, it, expect, vi } from "vitest";
import { createGitHubOperations } from "../src/github/operations.js";

// ─────────────────────────────────────────────────────────────
// Tests de OPERACIONES DE GITHUB con Octokit mockeado (integration)
// No llaman a la API real: createGitHubOperations recibe el octokit por parámetro,
// así que le pasamos uno falso hecho con vi.fn(), que simula respuestas de éxito y de error.
// Se prueba que la operación transforme la respuesta de GitHub en nuestro DTO,
// y que un error de la API se convierta en un mensaje claro.
// Los reintentos se configuran en 0 para que los tests no esperen.

// ¿Por qué inyección y no vi.mock()?
// vi.mock() reemplaza Octokit de forma global y depende del orden de los imports.
// En cambio, createGitHubOperations RECIBE el octokit por parámetro:
// en producción le pasamos el real (createOctokit) y en los tests uno falso (vi.fn).
// Eso es posible porque separamos client.ts de operations.ts.
// ─────────────────────────────────────────────────────────────

const SIN_REINTENTOS = { maxRetries: 0, baseDelayMs: 0, maxDelayMs: 0 };

describe("GitHubOperations", () => {
    it("listRepositories transforma la respuesta de GitHub en RepoDTO", async () => {
        const octokitFalso = {
            rest: {
                repos: {
                    listForAuthenticatedUser: vi.fn().mockResolvedValue({
                        data: [
                            {
                                full_name: "seba/demo",
                                owner: { login: "seba" },
                                name: "demo",
                                private: false,
                                description: null,
                                html_url: "https://github.com/seba/demo",
                                stargazers_count: 10,
                            },
                        ],
                    }),
                },
            },
        };
        const github = createGitHubOperations(octokitFalso as any, SIN_REINTENTOS);

        const repos = await github.listRepositories({ type: "all", sort: "updated", per_page: 20 });

        expect(repos).toEqual([
            {
                full_name: "seba/demo",
                owner: "seba",
                name: "demo",
                private: false,
                description: null,
                html_url: "https://github.com/seba/demo",
            },
        ]);
    });

    it("getRepository lanza un error claro si el repositorio no existe (404)", async () => {
        const octokitFalso = {
            rest: {
                repos: {
                    get: vi.fn().mockRejectedValue({ status: 404, response: { headers: {} } }),
                },
            },
        };
        const github = createGitHubOperations(octokitFalso as any, SIN_REINTENTOS);

        await expect(github.getRepository("seba", "no-existe")).rejects.toThrow(
            "El repositorio seba/no-existe no fue encontrado",
        );
    });
});