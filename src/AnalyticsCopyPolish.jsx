// Analytics labels are now owned by the global App Language layer.
// Keeping this component inert prevents two independent DOM enhancers from
// rewriting the same header and status chip in different languages.
export default function AnalyticsCopyPolish() {
  return null
}
