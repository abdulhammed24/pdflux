import { create } from 'zustand';

export const useStore = create((set) => ({
  pdfFile: null,
  annotations: [],
  setPdfFile: (file) => set({ pdfFile: file }),
  addAnnotation: (annotation) =>
    set((state) => ({ annotations: [...state.annotations, annotation] })),
  undoAnnotation: () =>
    set((state) => ({
      annotations: state.annotations.slice(0, -1),
    })),
  clearAnnotations: () => set({ annotations: [] }),
}));
