"""TTS base interfaces."""
from abc import ABC, abstractmethod
from typing import Optional, Dict, Any, AsyncGenerator, Literal
from typing_extensions import TypedDict


class ConfigField(TypedDict, total=False):
    type: Literal["string", "password", "number", "select", "file"]
    label: str
    description: str
    required: bool
    default: Any
    placeholder: str
    options: list[str]
    accept: str
    min: float
    max: float
    step: float
    level: Literal["provider", "voice"]
    sensitive: bool
    value: Any


class TTSBase(ABC):
    @classmethod
    @abstractmethod
    def get_config_template(cls) -> Dict[str, ConfigField]:
        raise NotImplementedError

    @abstractmethod
    async def synthesize_async(self, text: str, language: Optional[str] = None) -> bytes:
        raise NotImplementedError

    async def synthesize_stream(
        self,
        text: str,
        language: Optional[str] = None,
        media_type: str = "wav",
    ) -> AsyncGenerator[bytes, None]:
        audio_bytes = await self.synthesize_async(text, language)
        yield audio_bytes

    def supports_streaming(self) -> bool:
        return False

    def get_audio_mime_type(self) -> str:
        return "audio/wav"

    @abstractmethod
    async def test_connection(self) -> Dict[str, Any]:
        raise NotImplementedError
