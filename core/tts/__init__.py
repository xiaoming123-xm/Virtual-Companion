"""TTS module."""
from .base import TTSBase
from .registry import TTSRegistry
from .factory import TTSFactory

from . import gpt_sovits  # noqa: F401
from . import genie_tts  # noqa: F401
from . import qwen_tts  # noqa: F401
from . import edge_tts_local  # noqa: F401

__all__ = ["TTSBase", "TTSRegistry", "TTSFactory"]
