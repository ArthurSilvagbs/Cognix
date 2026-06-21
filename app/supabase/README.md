# Banco (Supabase) — migrations

O schema do banco é versionado em `migrations/` como arquivos `.sql` numerados por
timestamp. **Nunca edite o banco na mão pelo painel** — toda mudança é uma migration
nova, commitada no git e aplicada por comando. Assim o banco é reproduzível e auditável.

## Setup (uma vez por máquina)

```bash
npx supabase login                              # abre o navegador, autentica o CLI
npx supabase link --project-ref vzpuaauihykahlgbnfei   # liga este repo ao projeto hospedado (pede a senha do banco)
```

## Aplicar as migrations no banco hospedado

```bash
npm run db:push        # aplica as migrations ainda não aplicadas (sem Docker)
```

O CLI rastreia o que já rodou em `supabase_migrations.schema_migrations` — rodar de
novo não reaplica o que já foi.

## Criar uma mudança de schema

```bash
npm run db:new nome_da_mudanca   # cria migrations/<timestamp>_nome_da_mudanca.sql (vazio)
# edite o arquivo com o SQL da mudança
npm run db:push                  # aplica
```

## Histórico

- `20260618165411_init_schema.sql` — schema inicial: Plano → Matéria → Tópico + RLS por dono.
