# apiDados — Gerenciamento de Clientes

Este projeto dá continuidade à AP1. Desenvolvi uma API de clientes com ASP.NET Core e Entity Framework Core, usando SQLite para salvar os dados. A interface em `wwwroot` consome os endpoints da própria aplicação, e deixei uma Collection do Bruno para testar as requisições.

## Como executar

É necessário ter o SDK do .NET 10 instalado. Na pasta do projeto, execute:

```bash
dotnet restore
dotnet build
dotnet run --launch-profile http
```

Abra a interface em [http://localhost:5289/clientes.html](http://localhost:5289/clientes.html). Na primeira execução, o banco local `api-clientes.db` e a tabela são criados automaticamente. Se a tabela estiver vazia, a aplicação inclui dois clientes de exemplo.

## Rotas

| Método | Rota | Resultado |
|---|---|---|
| GET | `/api/cliente` | Lista os clientes (`200`) |
| GET | `/api/cliente/{id}` | Busca por ID (`200` ou `404`) |
| POST | `/api/cliente` | Cadastra um cliente (`201`) |
| PUT | `/api/cliente/{id}` | Atualiza um cliente (`200` ou `404`) |
| DELETE | `/api/cliente/{id}` | Exclui um cliente (`204` ou `404`) |

Para testar pelo Bruno, importe o arquivo `apiDadosCollection.yml` e deixe a API em execução.

## Vídeo de demonstração — AP2

[Assistir à demonstração](https://drive.google.com/file/d/1Osn_W3SYEL6Dno1205qu-DJKcdUByFw5/view?usp=sharing)

Repositório: [backend-ap1-api no GitHub](https://github.com/Gustavocostad/backend-ap1-api.git). A gravação deve estar acessível pelo link; confirme as permissões de compartilhamento antes da entrega.