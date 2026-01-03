

// toastService.ts
type ToastType = 'error' | 'success' | 'info' | 'warning';

interface Toast {
  id: string;
  type: ToastType;
  title: string;
  message: string;
}

type ToastListener = (toasts: Toast[]) => void;

class ToastService {
  private toasts: Toast[] = [];
  private listeners: ToastListener[] = [];

  subscribe(listener: ToastListener) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private notify() {
    this.listeners.forEach(listener => listener([...this.toasts]));
  }

  showError(title: string, message: string) {
    const id = Math.random().toString(36).substr(2, 9);
    this.toasts.push({ id, type: 'error', title, message });
    this.notify();

    setTimeout(() => {
      this.remove(id);
    }, 5000);
  }

  showSuccess(title: string, message: string = "") {
    const id = Math.random().toString(36).substr(2, 9);
    this.toasts.push({ id, type: 'success', title, message });
    this.notify();

    setTimeout(() => {
      this.remove(id);
    }, 5000);
  }

  remove(id: string) {
    this.toasts = this.toasts.filter(t => t.id !== id);
    this.notify();
  }
}

export const toastService = new ToastService();

// Usage example:
// 
// 1. Add ToastContainer to your root component (App.tsx):
//    function App() {
//      return (
//        <>
//          <YourApp />
//          <ToastContainer />
//        </>
//      );
//    }
//
// 2. Call from anywhere:
//    import { toastService } from './toastService';
//    
//    const prm = dispatch(getEvents({ start: start, end: endDate }));
//    prm.catch(err => {
//      toastService.showError('Failed to load events', `Error: ${err}`);
//    });