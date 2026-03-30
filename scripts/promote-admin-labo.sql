
UPDATE dbo.Users
SET roleId = 2
WHERE LOWER(LTRIM(RTRIM(email))) = LOWER(N'labo.nikole2004@gmail.com');

