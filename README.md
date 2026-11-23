# apiDados — Gerenciamento de Clientes (AS)

## Tema e objetivo

API de **clientes** construída nas avaliações parciais (AP1 e AP2) e consolidada nesta avaliação semestral (AS). O foco é organizar o código por responsabilidade (entidade, DTO e contexto), manter o CRUD persistente com ASP.NET Core, Entity Framework Core e SQLite, e demonstrar o funcionamento pela Collection do Bruno.

## Requisitos

- SDK do [.NET 10](https://dotnet.microsoft.com/download)
- (Opcional) [Bruno](https://www.usebruno.com/) para executar a Collection em `bruno/`
- Navegador, se quiser usar a interface em `wwwroot`

## Preparação e execução

Na pasta do projeto:

```bash
dotnet restore
dotnet build
dotnet run --launch-profile http
```

A API sobe em [http://localhost:5289](http://localhost:5289). A interface fica em [http://localhost:5289/clientes.html](http://localhost:5289/clientes.html).

### Banco de dados

O projeto **não usa migrations**. Na inicialização, `Program.cs` chama `Database.EnsureCreated()`: o arquivo SQLite local `api-clientes.db` e a tabela são criados automaticamente na primeira execução. Se a tabela estiver vazia, dois clientes de exemplo são inseridos.

O banco local de teste está no `.gitignore` e **não** deve ser versionado. Para reproduzir o ambiente, basta executar `dotnet run`; o banco é recriado pelo procedimento acima.

## Estrutura de pastas

```text
apiDados/
├── Program.cs                 # Inicialização, registro do DbContext, middleware e rotas
├── apiDados.csproj            # Projeto .NET 10 e pacotes (EF Core + SQLite)
├── appsettings.json           # Configuração (connection string)
├── Models/
│   └── clienteBase.cs         # Entidade ClienteBase (persistida no banco)
├── Dtos/
│   └── dadosDto.cs            # DTO de entrada ClienteEntrada (record)
├── Data/
│   └── apiDbContext.cs        # Contexto ApiDbContext do Entity Framework Core
├── bruno/
│   └── apiDadosCollection.yml # Collection do Bruno (ambiente local / porta 5289)
├── wwwroot/                   # Interface HTML/CSS/JS da AP2
├── Properties/
│   └── launchSettings.json    # Perfis e porta (http://localhost:5289)
└── README.md
```

Cada tipo usado pela aplicação fica em um arquivo na pasta correspondente. O `Program.cs` não redefine esses tipos: apenas importa os namespaces `APIDADOS.Models`, `APIDADOS.Dtos` e `APIDADOS.Data`.

## Rotas

| Método | Rota | Resultado |
|---|---|---|
| GET | `/api/cliente` | Lista os clientes (`200`) |
| GET | `/api/cliente/{id}` | Busca por ID (`200` ou `404`) |
| POST | `/api/cliente` | Cadastra um cliente (`201`) |
| PUT | `/api/cliente/{id}` | Atualiza um cliente (`200` ou `404`) |
| DELETE | `/api/cliente/{id}` | Exclui um cliente (`204` ou `404`) |

## Exemplos de JSON

**POST / PUT** — corpo de entrada (`ClienteEntrada`):

```json
{
  "nome": "Gustavo",
  "email": "gustavo@email.com",
  "telefone": "51999999999"
}
```

**Resposta típica de criação/consulta** (`ClienteBase`):

```json
{
  "id": 3,
  "nome": "Gustavo",
  "email": "gustavo@email.com",
  "telefone": "51999999999"
}
```

Use sempre o `id` retornado no `POST`; não presume que será `1` ou `3`.

## Collection do Bruno

Arquivo: [`bruno/apiDadosCollection.yml`](bruno/apiDadosCollection.yml)

1. Abra o Bruno e importe a Collection dessa pasta.
2. Confirme a URL base `http://localhost:5289` (mesma porta do perfil `http`).
3. Com a API em execução, rode o roteiro:
   - `GET /api/cliente` → `200` e listagem
   - `POST /api/cliente` → `201` e registro com identificador
   - `GET /api/cliente/{id-criado}` → `200` com os mesmos dados
   - `PUT /api/cliente/{id-criado}` → `200` com dados atualizados; consulte de novo para confirmar
   - `DELETE /api/cliente/{id-criado}` → `204` sem corpo
   - `GET /api/cliente/{id-criado}` → `404` após a exclusão
   - Cadastre um **segundo** registro (não excluído), pare a API, inicie de novo e consulte o mesmo id: o registro permanece no SQLite

## Vídeo de demonstração — AS


[Assistir à demonstração da AS]()

Repositório: [backend-ap1-api no GitHub](https://github.com/Gustavocostad/backend-ap1-api.git).
