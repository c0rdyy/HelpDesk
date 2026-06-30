from enum import StrEnum


class RequestStatus(StrEnum):
    new = "new"
    in_progress = "in_progress"
    done = "done"


class RequestPriority(StrEnum):
    low = "low"
    normal = "normal"
    high = "high"
