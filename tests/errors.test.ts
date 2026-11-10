import { describe, it, expect } from "vitest";
import { toAppError, AuthenticationError } from "../src/errors/index.js";

// ─────────────────────────────────────────────────────────────
// Tests de TRANSFORMACIÓN DE ERRORES (unit)
// Verifican que toAppError convierta un error técnico de Octokit (un status HTTP)
// en un error claro, con su tipo, un mensaje en lenguaje natural y si se puede reintentar.
// Son unit tests porque toAppError es una función pura: no usa GitHub ni mocks.
// El error de Octokit se simula con un objeto que tiene solo status y response
// (sin response, toAppError lo interpretaría como un error de red).
// ─────────────────────────────────────────────────────────────

describe("toAppError", () => {
    it("traduce un 404 al mensaje en lenguaje natural con el nombre del repo", () => {
        const errorDeOctokit = { status: 404, response: { headers: {} } };

        const err = toAppError(errorDeOctokit, { operation: "crear el issue", owner: "seba", repo: "no-existe" });

        expect(err.code).toBe("GITHUB_API_ERROR");
        expect(err.message).toBe("El repositorio seba/no-existe no fue encontrado. Verifica el nombre e intenta de nuevo.");
        expect(err.retryable).toBe(false);
    });

    it("traduce un 401 a AuthenticationError, sin reintentar", () => {
        const errorDeOctokit = { status: 401, response: { headers: {} } };

        const err = toAppError(errorDeOctokit, { operation: "listar tus repositorios" });

        expect(err).toBeInstanceOf(AuthenticationError);
        expect(err.code).toBe("AUTH_ERROR");
        expect(err.retryable).toBe(false);
    });
});