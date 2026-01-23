type PlaceholderPageProps = {
  title: string;
  description?: string;
};

function PlaceholderPage({
  title,
  description = "This module is under development.",
}: PlaceholderPageProps) {
  return (
    <div className="max-w-2xl bg-white rounded-lg border border-slate-200 shadow-sm p-8">
      <h2 className="text-xl font-semibold mb-2">
        {title}
      </h2>

      <p className="text-sm text-slate-600">
        {description}
      </p>
    </div>
  );
}

export default PlaceholderPage;
