import { useCallback, useState } from "react";
import { PageButton } from "./types";

interface ContextMenuState {
  visible: boolean;
  position: { x: number; y: number };
  buttons: PageButton[];
}

export const useContextMenu = () => {
  const [state, setState] = useState<ContextMenuState>({
    visible: false,
    position: { x: 0, y: 0 },
    buttons: [],
  });

  const showContextMenu = useCallback((event: React.MouseEvent, buttons: PageButton[]) => {
    event.preventDefault();
    event.stopPropagation();

    setState({
      visible: true,
      position: { x: event.clientX, y: event.clientY },
      buttons,
    });
  }, []);

  const hideContextMenu = useCallback(() => {
    setState((prev) => ({
      ...prev,
      visible: false,
    }));
  }, []);

  const updateButtons = useCallback((buttons: PageButton[]) => {
    setState((prev) => ({
      ...prev,
      buttons,
    }));
  }, []);

  return {
    ...state,
    showContextMenu,
    hideContextMenu,
    updateButtons,
  };
};
