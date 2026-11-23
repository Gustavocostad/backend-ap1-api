namespace APIDADOS.Models;

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