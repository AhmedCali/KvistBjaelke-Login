namespace LoginApi.Dtos;

public record UserResponse(int Id, string Username, string Role);
public record CreateUserRequest(string Username, string Password, string Role);
public record UpdateUserRequest(string? Username, string? Password, string? Role);