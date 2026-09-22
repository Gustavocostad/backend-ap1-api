var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddRazorPages();

var app = builder.Build();


var clientes = new List<ClienteBase>

{
    new ClienteBase(1, "Administrador", "admin@email.com", "55123456789"),
    new ClienteBase(2, "Suporte", "suporte@email.com", "55987654321")
};

app.MapGet("/", () =>
{
    return Results.Ok("API de clientes está no ar");
});

app.MapPost("/api/cliente", (ClienteEntrada dados) =>
{
    int proximoId = clientes.Count + 1;

        
    var novoCliente = new ClienteBase(proximoId, dados.Nome, dados.Email, dados.Telefone);
        
    

    clientes.Add(novoCliente);

    return Results.Created($"/api/cliente/{novoCliente.Id}", novoCliente);
});

app.MapGet("/api/cliente", () =>
{
    return Results.Ok(clientes);
}); 

app.MapGet("/api/cliente/{id:int}", (int id) =>
{
    var cliente = clientes.FirstOrDefault(c => c.Id == id);

    if (cliente is null)
    {
        return Results.NotFound();
    }

    return Results.Ok(cliente);
});

app.MapPut("/api/cliente/{id:int}", (int id, ClienteEntrada dados) =>
{
    var clienteExiste = clientes.FirstOrDefault(c => c.Id == id);

    if (clienteExiste is null)
    {
        return Results.NotFound();
    }

    var clienteAtualizado = new ClienteBase(id, dados.Nome, dados.Email, dados.Telefone);
    clientes[clientes.IndexOf(clienteExiste)] = clienteAtualizado;

    return Results.Ok(clienteAtualizado);
});

app.MapDelete("/api/cliente/{id:int}", (int id) =>
{
    var clienteExiste = clientes.FirstOrDefault(c => c.Id == id);

    if (clienteExiste is null)
    {
        return Results.NotFound();
    }

    clientes.Remove(clienteExiste);

    return Results.NoContent();
});




app.Run();

record ClienteBase(int Id, string Nome, string Email, string Telefone);
record ClienteEntrada(string Nome, string Email, string Telefone);