interface TaskPaneProps {
  title: string;
  instruction: string;
}

export function TaskPane({ title, instruction }: TaskPaneProps) {
  return (
    <div className="h-full min-w-0 p-6 md:p-8">
      <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">
        Task
      </p>
      <h1 className="mt-2 text-3xl font-bold text-foreground">{title}</h1>
      <p className="mt-3 text-sm leading-7 text-muted-foreground">
        {instruction}
      </p>
    </div>
  );
}
