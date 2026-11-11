import { describe, it, expect } from "vitest";
import { CreateRepositorySchema, ListRepositoriesSchema, CreateCommitSchema } from "../src/schemas/index.js";

// Tests de CONTRATO : ¿el schema deja pasar lo válido y frena lo inválido? 




describe("ListRepositoriesSchema", () => {
    it("rechaza per_page mayor a 100", () => {
        const res = ListRepositoriesSchema.safeParse({ per_page: 500 });
        expect(res.success).toBe(false);
    });
});

describe("CreateRepositorySchema", () => {
    it("acepta un nombre válido con letras, números y guiones", () => {
        const res = CreateRepositorySchema.safeParse({ name: "mi-proyecto-2" });
        expect(res.success).toBe(true);

    });

    it("rechaza un nombre con espacios", () => {
        const res = CreateRepositorySchema.safeParse({ name: "mi repo" });
        expect(res.success).toBe(false);
        expect(res.error?.issues[0].path[0]).toBe("name");
    });

    it("rechaza un nombre con menos de 3 caracteres", () => {
        const res = CreateRepositorySchema.safeParse({ name: "ab" });
        expect(res.success).toBe(false);
        expect(res.error?.issues[0].message).toMatch(/al menos 3 caracteres/);
    });
    describe("CreateCommitSchema", () => {
        it("rechaza un path que intenta salir de la carpeta con ..", () => {
            const res = CreateCommitSchema.safeParse({
                owner: "seba",
                repo: "demo-mcp-2",
                path: "../repo-mcp/archivo.txt",
                content: "hola",
                message: "prueba",
            });
            expect(res.success).toBe(false);
            expect(res.error?.issues[0].path[0]).toBe("path");
        });
    });
});
