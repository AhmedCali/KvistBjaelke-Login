namespace LoginApi.Dtos;

public record RegisterRequest(string Username, string Password);
public record LoginRequest(string Username, string Password);
public record LoginResponse(string Token, string Username, string Role);