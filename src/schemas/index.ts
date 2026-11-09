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