using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

// Configuração do SQLite via Entity Framework Core
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection") 
                       ?? "Data Source=api-clientes.db";

builder.Services.AddDbContext<ApiDbContext>(options =>
    options.UseSqlite(connectionString));

// Habilitar CORS para permitir requisições de qualquer origem
builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

var app = builder.Build();

// Garantir a criação do banco de dados SQLite e aplicar carga inicial se estiver vazio
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<ApiDbContext>();
    db.Database.EnsureCreated();

    if (!db.Clientes.Any())
    {
        db.Clientes.AddRange(
            new ClienteBase(1, "Administrador", "admin@email.com", "55123456789"),
            new ClienteBase(2, "Suporte", "suporte@email.com", "55987654321")
        );
        db.SaveChanges();
    }
}

app.UseCors();

// Habilitar arquivos estáticos (HTML, CSS, JS na pasta wwwroot)
app.UseDefaultFiles();
app.UseStaticFiles();

// 1. Rota de status da API
app.MapGet("/", (HttpContext context) =>
{
    // Se a requisição partir de um navegador web solicitando HTML diretamente na raiz, redireciona para a interface
    if (context.Request.Headers.Accept.Any(h => h != null && h.Contains("text/html")))
    {
        return Results.Redirect("/clientes.html");
    }

    return Results.Ok("API de clientes está no ar");
});

app.MapGet("/status", () => Results.Ok("API de clientes está no ar"));
app.MapGet("/clientes", () => Results.Redirect("/clientes.html"));

// 2. Listar todos os clientes
app.MapGet("/api/cliente", async (ApiDbContext db) =>
{
    var clientes = await db.Clientes.AsNoTracking().ToListAsync();
    return Results.Ok(clientes);
});

// 3. Obter cliente por ID
app.MapGet("/api/cliente/{id:int}", async (int id, ApiDbContext db) =>
{
    var cliente = await db.Clientes.FindAsync(id);
    if (cliente is null)
    {
        return Results.NotFound(new { mensagem = $"Cliente com ID {id} não encontrado." });
    }

    return Results.Ok(cliente);
});

// 4. Cadastrar novo cliente
app.MapPost("/api/cliente", async (ClienteEntrada dados, ApiDbContext db) =>
{
    if (string.IsNullOrWhiteSpace(dados.Nome) ||
        string.IsNullOrWhiteSpace(dados.Email) ||
        string.IsNullOrWhiteSpace(dados.Telefone))
    {
        return Results.BadRequest(new { mensagem = "Os campos 'nome', 'email' e 'telefone' são obrigatórios." });
    }

    var novoCliente = new ClienteBase
    {
        Nome = dados.Nome.Trim(),
        Email = dados.Email.Trim(),
        Telefone = dados.Telefone.Trim()
    };

    db.Clientes.Add(novoCliente);
    await db.SaveChangesAsync();

    return Results.Created($"/api/cliente/{novoCliente.Id}", novoCliente);
});

// 5. Atualizar cliente por ID
app.MapPut("/api/cliente/{id:int}", async (int id, ClienteEntrada dados, ApiDbContext db) =>
{
    if (string.IsNullOrWhiteSpace(dados.Nome) ||
        string.IsNullOrWhiteSpace(dados.Email) ||
        string.IsNullOrWhiteSpace(dados.Telefone))
    {
        return Results.BadRequest(new { mensagem = "Os campos 'nome', 'email' e 'telefone' são obrigatórios." });
    }

    var clienteExiste = await db.Clientes.FindAsync(id);
    if (clienteExiste is null)
    {
        return Results.NotFound(new { mensagem = $"Cliente com ID {id} não encontrado." });
    }

    clienteExiste.Nome = dados.Nome.Trim();
    clienteExiste.Email = dados.Email.Trim();
    clienteExiste.Telefone = dados.Telefone.Trim();

    await db.SaveChangesAsync();

    return Results.Ok(clienteExiste);
});

// 6. Remover cliente por ID
app.MapDelete("/api/cliente/{id:int}", async (int id, ApiDbContext db) =>
{
    var cliente = await db.Clientes.FindAsync(id);
    if (cliente is null)
    {
        return Results.NotFound(new { mensagem = $"Cliente com ID {id} não encontrado." });
    }

    db.Clientes.Remove(cliente);
    await db.SaveChangesAsync();

    return Results.NoContent();
});

app.Run();

// Definições de Modelos e DbContext
public class ClienteBase
{
    public int Id { get; set; }
    public string Nome { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Telefone { get; set; } = string.Empty;

    public ClienteBase() { }

    public ClienteBase(int id, string nome, string email, string telefone)
    {
        Id = id;
        Nome = nome;
        Email = email;
        Telefone = telefone;
    }
}

public record ClienteEntrada(string Nome, string Email, string Telefone);

public class ApiDbContext : DbContext
{
    public ApiDbContext(DbContextOptions<ApiDbContext> options) : base(options)
    {
    }

    public DbSet<ClienteBase> Clientes => Set<ClienteBase>();
}
