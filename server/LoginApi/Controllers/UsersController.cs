using LoginApi.Data;
using LoginApi.Dtos;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace LoginApi.Controllers;

[ApiController]
[Route("api/users")]
[Authorize]
public class UsersController(AppDbContext db) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<List<UserResponse>>> GetAll()
    {
        return await db.Users
            .OrderBy(u => u.Id)
            .Select(u => new UserResponse(u.Id, u.Username, u.Role))
            .ToListAsync();
    }
}