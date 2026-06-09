"""Errores de dominio."""


class KorrienteError(Exception):
    """Base de todos los errores del dominio."""


class LimitExceededError(KorrienteError):
    """Se superó una cuota del plan o el budget cap."""


class UnknownPlanError(KorrienteError):
    """Se referenció un plan que no existe."""


class UnknownAgentError(KorrienteError):
    """Se referenció un agente que no existe."""
