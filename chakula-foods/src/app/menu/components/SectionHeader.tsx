interface SectionHeaderProps {
  icon: string;
  iconBg: string;
  title: string;
  description: string;
}

export function SectionHeader({ icon, iconBg, title, description }: SectionHeaderProps) {
  return (
    <div className="cf-section-header">
      <div className="cf-section-icon" style={{ background: iconBg }}>
        {icon}
      </div>
      <div className="cf-section-title">
        <h2>{title}</h2>
        <p>{description}</p>
      </div>
    </div>
  );
}
