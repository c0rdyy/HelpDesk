class UsernameAlreadyExistsError(Exception):
    """Exception raised when a username already exists in the system."""

    def __init__(self, username: str) -> None:
        self.username = username
        self.message = f"Username '{username}' already exists."
        super().__init__(self.message)


class EmailAlreadyExistsError(Exception):
    """Exception raised when an email already exists in the system."""

    def __init__(self, email: str) -> None:
        self.email = email
        self.message = f"Email '{email}' already exists."
        super().__init__(self.message)


class UserNotFoundError(Exception):
    """Exception raised when a user is not found in the system."""

    def __init__(self, user_id: int) -> None:
        self.user_id = user_id
        self.message = f"User with ID '{user_id}' not found."
        super().__init__(self.message)


class InvalidCredentialsError(Exception):
    """Exception raised when provided credentials are invalid."""

    def __init__(self) -> None:
        self.message = "Invalid credentials provided."
        super().__init__(self.message)


class UserNotActiveError(Exception):
    """Exception raised when a user is not active."""

    def __init__(self, user_id: int) -> None:
        self.user_id = user_id
        self.message = f"User with ID '{user_id}' is not active."
        super().__init__(self.message)


class InvalidRefreshTokenError(Exception):
    pass


class CannotModifyOwnAccountError(Exception):
    """Exception raised when a user tries to modify their own account."""

    def __init__(self) -> None:
        self.message = "You cannot modify your own account."
        super().__init__(self.message)


class LastAdminCannotBeModifiedError(Exception):
    """Exception raised when an action would leave the system without an active admin."""

    def __init__(self) -> None:
        self.message = "There must be at least one active admin left."
        super().__init__(self.message)
