from typing import ClassVar
from pydantic import BaseModel, ConfigDict, model_validator


class InputModel(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True, allow_inf_nan=False)


class PatchModel(InputModel):
    """Omitted fields stay unchanged; required database columns cannot be cleared."""

    required_fields: ClassVar[set[str]] = set()

    @model_validator(mode="before")
    @classmethod
    def reject_null_required_fields(cls, values):
        if isinstance(values, dict):
            for field in cls.required_fields:
                if field in values and values[field] is None:
                    raise ValueError(f"{field} cannot be null")
        return values
