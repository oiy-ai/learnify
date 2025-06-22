import * as styles from './properties.css';

export const StackProperty = ({
  icon,
  children,
}: {
  icon: React.ReactNode;
  children: React.ReactNode;
}) => {
  return (
    <div className={styles.stackItem}>
      <div className={styles.stackItemContent}>
        <div className={styles.stackItemIcon}>{icon}</div>
        <div className={styles.stackItemLabel}>{children}</div>
      </div>
    </div>
  );
};
