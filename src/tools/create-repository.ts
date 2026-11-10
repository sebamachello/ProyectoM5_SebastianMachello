import type { McpTool } from "../types.js";
import type { GitHubOperations } from "../github/operations.js";
import { CreateRepositorySchema, toJsonSchema } from "../schemas/index.js";
import { fromZodError, fail } from "../errors/index.js";

export function createRepositoryTool(github: GitHubOperations): McpTool {
    return {
        definition: {
            name: "create_repository",
            description:
                "Crea un repositorio NUEVO en la cuenta del usuario autenticado (el dueño del token). " +
                "Requiere name; description y private son opcionales (por defecto, público y sin descripción). " +
                "Se crea con un README inicial, listo para recibir commits. " +
                "El nombre solo admite letras, números y guiones, entre 3 y 100 caracteres. " +
                "Escribe en GitHub: el repositorio queda creado. No sirve para crear issues ni commits, " +
                "ni para crear repos en organizaciones.",
            inputSchema: toJsonSchema(CreateRepositorySchema),
        },

        async handler(args) {
            const parsed = CreateRepositorySchema.safeParse(args);
            if (!parsed.success) return fail("create_repository", fromZodError(parsed.error));

            try {
                const repository = await github.createRepository(parsed.data);

                const data = { repository };
                return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }], structuredContent: data };
            } catch (err) {
                return fail("create_repository", err);
            }
        },
    };
}