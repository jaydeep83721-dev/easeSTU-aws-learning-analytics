type BrandLogoProps = {
  compact?: boolean;
  className?: string;
};

export function BrandLogo({ compact = false, className = "" }: BrandLogoProps) {
  return (
    <img
      className={`brand-logo-image ${className}`.trim()}
      src={compact ? "/easestu-mark.png" : "/easestu-logo.png"}
      width={compact ? 128 : 401}
      height={compact ? 128 : 90}
      alt="easeSTU"
    />
  );
}
