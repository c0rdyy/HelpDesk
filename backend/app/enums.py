from enum import StrEnum


class RequestStatus(StrEnum):
    new = "new"
    in_progress = "in_progress"
    done = "done"


class RequestPriority(StrEnum):
    """Represents the priority levels for requests.
    Attributes:
        low (str): Represents a low priority level.
        normal (str): Represents a normal priority level.
        high (str): Represents a high priority level.
    """

    low = "low"
    normal = "normal"
    high = "high"


class UserRole(StrEnum):
    """Represents the roles assigned to users.
    Attributes:
        admin (str): Represents an administrative role with elevated privileges.
        user (str): Represents a standard user role with limited privileges.
    """

    admin = "admin"
    user = "user"
