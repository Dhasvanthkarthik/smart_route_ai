import bcrypt

password = "123456"
hashed = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
print(f"Hashed: {hashed}")

is_valid = bcrypt.checkpw(password.encode('utf-8'), hashed.encode('utf-8'))
print(f"Is valid: {is_valid}")
