// Modal 栈管理器，用于追踪打开的 Modal
// 使用模块级状态，不依赖 DOM API

type ModalId = symbol;

class ModalStackManager {
  private stack: ModalId[] = [];
  private listeners: Set<(stack: ModalId[]) => void> = new Set();

  // 注册一个新的 Modal，返回它的 ID
  register(): ModalId {
    const id = Symbol("modal");
    this.stack.push(id);
    this.notifyListeners();
    return id;
  }

  // 取消注册 Modal
  unregister(id: ModalId): void {
    const index = this.stack.indexOf(id);
    if (index !== -1) {
      this.stack.splice(index, 1);
      this.notifyListeners();
    }
  }

  // 检查给定的 Modal 是否是最上层的
  isTopModal(id: ModalId): boolean {
    if (this.stack.length === 0) return false;
    return this.stack[this.stack.length - 1] === id;
  }

  // 获取栈中 Modal 的数量
  getStackSize(): number {
    return this.stack.length;
  }

  // 订阅栈变化（如果需要的话）
  subscribe(listener: (stack: ModalId[]) => void): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notifyListeners(): void {
    this.listeners.forEach((listener) => listener([...this.stack]));
  }
}

export const modalStackManager = new ModalStackManager();
