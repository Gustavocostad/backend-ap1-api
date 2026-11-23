namespace APIDADOS.Data;
using APIDADOS.Models;
using Microsoft.EntityFrameworkCore;


public class ApiDbContext : DbContext
{
    public ApiDbContext(DbContextOptions<ApiDbContext> options) : base(options)
    {
    }

    public DbSet<ClienteBase> Clientes => Set<ClienteBase>();
}