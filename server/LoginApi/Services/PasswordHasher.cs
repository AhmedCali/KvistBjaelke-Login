using Isopoh.Cryptography.Argon2;

namespace LoginApi.Services;

public static class PasswordHasher
{
    public static string Hash(string password)
    {
        return Argon2.Hash(password);
    }

    public static bool Verify(string password, string hash)
    {
        return Argon2.Verify(hash, password);
    }
}

