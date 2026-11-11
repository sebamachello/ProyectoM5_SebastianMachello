import { z } from "zod";

const owner = z.string().trim().min(1, "owner es requerido").describe("dueño del repositorio: usuario o organiciónza de Github. EJ: octocat");
const repo = z.string().trim().min(1, "repo es requerido").describe("Nombre del repositorio, sin el owner. EJ: mi-repositorio");

export const CreateIssueSchema = z.object({
    owner,
    repo,
    title: z.string().trim().min(3, "title necesita al menos 3 caracteres").max(256, "title admite hasta 256 caracteres").describe("Titulo de la Issue"),
    body: z.string().max(65_000, "body es demasiado largo").optional().describe("Descripcion del issue en markdown"),
    labels: z.array(z.string().min(1)).max(10, "maximo 10 labels").optional().describe("Etiquetas que YA existen en el repo. EJ : [\"bug\"] ")

})

export type CreateIssueInput = z.infer<typeof CreateIssueSchema>;


export const ListRepositoriesSchema = z.object({
    type: z.enum(["all", "public", "private"]).default("all").describe("Que repos listar: todos, solo publicos o privados"),
    sort: z.enum(["created", "updated", "pushed", "full_name"]).default("updated").describe("Ordenar por listado"),
    per_page: z.number().int().min(1).max(100).default(20).describe("Cantidad de repos a devolver (1 a 100)"),

});

export type ListRepositoriesInput = z.infer<typeof ListRepositoriesSchema>;

export function toJsonSchema(schema: z.ZodType): Record<string, unknown> {
    const { $schema: _ignorado, ...json } = z.toJSONSchema(schema, { io: "input" }) as Record<string, unknown>;
    return json;
}

export const CreateCommitSchema = z.object({
    owner,
    repo,
    path: z.string().trim().min(1, "path es requerido").refine((p) => !p.startsWith("/"), "path no puede empezar con /").refine((p) => !p.split("/").includes(".."), "path no puede contener '..'")
        .describe("Ruta del archivo dentro del repo, sin / al inicio. Ej: docs/notas.md"),
    content: z.string().min(1, "Contenido requerido").describe("Contenido COMPLETO del archivo (texto). Si el archivo existe, se reemplaza entero"),
    message: z.string().min(1, "mensaje requerido").describe("Mensaje del commit"),
    branch: z.string().optional().describe("Rama donde se hace el commit. Si no se manda, se usa la rama principal del repo")
})

export const CreateRepositorySchema = z.object({
    name: z.string()
        .min(3, "name debe tener al menos 3 caracteres")
        .max(100, "name no puede superar los 100 caracteres")
        .regex(/^[a-zA-Z0-9-]+$/, "name solo puede tener letras, números y guiones (sin espacios ni otros símbolos). Ej: mi-proyecto-2")
        .describe("Nombre del repositorio nuevo: entre 3 y 100 caracteres, solo letras, números y guiones. Ej: mi-proyecto-2"),

    description: z.string().trim().default("")
        .describe("Descripción corta del repositorio, la que aparece en su página de GitHub. Opcional"),

    private: z.boolean().default(false)
        .describe("true para crear el repositorio privado, false para público. Por defecto, público"),
});

export type CreateRepositoryInput = z.infer<typeof CreateRepositorySchema>;

export const ListIssuesSchema = z.object({
    owner,
    repo,
    state: z.enum(["open", "closed", "all"]).default("open")
        .describe("Qué issues listar: 'open' (abiertos), 'closed' (cerrados) o 'all' (todos). Por defecto, abiertos"),
    per_page: z.number().int().min(1).max(100).default(20)
        .describe("Cantidad de issues a devolver (1 a 100). Por defecto, 20"),
});

export type ListIssuesInput = z.infer<typeof ListIssuesSchema>;