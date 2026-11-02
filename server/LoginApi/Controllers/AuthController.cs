using LoginApi.Data;
using LoginApi.Dtos;
using LoginApi.Entities;
using LoginApi.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace LoginApi.Controllers;

[ApiController]
[Route("api/auth")]
public class AuthController(AppDbContext db, TokenService tokens) : ControllerBase
{
    [HttpPost("register")]
    public async Task<IActionResult> Register(RegisterRequest request)
    {
        var username = request.Username.Trim();

        if (username.Length < 3)
            return BadRequest("Username must be at least 3 characters!");

        if (request.Password.Length < 8)
            return BadRequest("Password must be at least 8 characters!");

        if (await db.Users.AnyAsync(u => u.Username == username))
            return Conflict("Username is already taken!");

        var user = new User
        {
            Username = username,
            PasswordHash = PasswordHasher.Hash(request.Password),
            Role = "user"
        };

        db.Users.Add(user);
        await db.SaveChangesAsync();

        return StatusCode(201);
    }

    [HttpPost("login")]
    public async Task<ActionResult<LoginResponse>> Login(LoginRequest request)
    {
        var username = request.Username.Trim();
        var user = await db.Users.FirstOrDefaultAsync(u => u.Username == username);

        if (user is null || !PasswordHasher.Verify(request.Password, user.PasswordHash))
            return Unauthorized("Invalid username or password!");

        return new LoginResponse(tokens.CreateToken(user), user.Username, user.Role);
    }
}