type Props = {
  href?: string;
  children?: React.ReactNode;
  /** Solid near-black slab (hero pledge). Default is the outlined hairline. */
  solid?: boolean;
  className?: string;
};

/**
 * The one action. A bronze fill wipes in left-to-right on hover via clip-path
 * (220ms ease-out); scale on press. Inherits the section's text colour, so it
 * reads on cream or charcoal. Hover is gated to fine pointers in globals.css.
 */
export function PledgeCTA({
  href = "#close",
  children = "Make a Pledge",
  solid = false,
  className,
}: Props) {
  return (
    <a
      href={href}
      className={`cta${solid ? " cta--solid" : ""}${className ? ` ${className}` : ""}`}
    >
      <span className="cta__fill" aria-hidden />
      <span>{children}</span>
      <span className="cta__arrow" aria-hidden>
        &#8594;
      </span>
    </a>
  );
}
