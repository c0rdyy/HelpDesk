class RequestNotFoundError(Exception):
    pass


class DoneRequestCannotBeEditedError(Exception):
    pass


class DoneRequestCannotBeDeletedError(Exception):
    pass


class OnlyAdminCanDeleteRequestError(Exception):
    pass
