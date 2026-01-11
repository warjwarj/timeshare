import type { ReactNode } from "react";

type ViewBodyProps = {
  id: string
  children: ReactNode
}

export const ViewBody: React.FC<ViewBodyProps> = ({ id, children }) => {
  return (
    <div id={id} className="flex flex-col h-[calc(100dvh-5rem)]">
      {children}
    </div>
  );
}