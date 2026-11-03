using System.Security.Claims;
using LoginApi.Data;
using LoginApi.Dtos;
using LoginApi.Entities;
using LoginApi.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace LoginApi.Controllers;

[ApiController]
[Route("api/users")]
[Authorize]
public class UsersController(AppDbContext db) : ControllerBase
{
    private static readonly string[] AllowedRoles = ["user", "superuser", "admin"];

    private string CurrentRole => User.FindFirstValue(ClaimTypes.Role) ?? "";

    // admin må alt, superuser må kun røre almindelige brugere
    private bool CanManage(string targetRole) =>
        CurrentRole == "admin" || (CurrentRole == "superuser" && targetRole == "user");

    [HttpGet]
    public async Task<ActionResult<List<UserResponse>>> GetAll()
    {
        return await db.Users
            .OrderBy(u => u.Id)
            .Select(u => new UserResponse(u.Id, u.Username, u.Role))
            .ToListAsync();
    }

    [HttpPost]
    [Authorize(Roles = "superuser,admin")]
    public async Task<ActionResult<UserResponse>> Create(CreateUserRequest request)
    {
        var username = request.Username.Trim();

        if (!AllowedRoles.Contains(request.Role))
            return BadRequest("Unknown role!");
        if (!CanManage(request.Role))
            return Forbid();
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
            Role = request.Role
        };

        db.Users.Add(user);
        await db.SaveChangesAsync();

        return StatusCode(201, new UserResponse(user.Id, user.Username, user.Role));
    }

    [HttpPut("{id:int}")]
    [Authorize(Roles = "superuser,admin")]
    public async Task<IActionResult> Update(int id, UpdateUserRequest request)
    {
        var user = await db.Users.FindAsync(id);
        if (user is null)
            return NotFound();

        // man må ikke ændre en bruger, man ikke har rettigheder til
        if (!CanManage(user.Role))
            return Forbid();

        if (request.Role is not null)
        {
            if (!AllowedRoles.Contains(request.Role))
                return BadRequest("Unknown role!");
            if (!CanManage(request.Role))
                return Forbid();
            user.Role = request.Role;
        }

        if (request.Username is not null)
        {
            var username = request.Username.Trim();
            if (username.Length < 3)
                return BadRequest("Username must be at least 3 characters!");
            if (await db.Users.AnyAsync(u => u.Username == username && u.Id != id))
                return Conflict("Username is already taken!");
            user.Username = username;
        }

        if (request.Password is not null)
        {
            if (request.Password.Length < 8)
                return BadRequest("Password must be at least 8 characters!");
            user.PasswordHash = PasswordHasher.Hash(request.Password);
        }

        await db.SaveChangesAsync();
        return NoContent();
    }

    [HttpDelete("{id:int}")]
    [Authorize(Roles = "superuser,admin")]
    public async Task<IActionResult> Delete(int id)
    {
        var user = await db.Users.FindAsync(id);
        if (user is null)
            return NotFound();

        if (!CanManage(user.Role))
            return Forbid();

        if (user.Id.ToString() == User.FindFirstValue(ClaimTypes.NameIdentifier))
            return BadRequest("You can't delete yourself!");

        db.Users.Remove(user);
        await db.SaveChangesAsync();
        return NoContent();
    }
}