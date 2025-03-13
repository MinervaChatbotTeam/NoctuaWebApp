import { cva } from "class-variance-authority";
import * as React from "react";
import { cn } from "../../lib/utils";

const cardVariants = cva("w-full relative transition-all duration-200", {
  variants: {
    variant: {
      default: [
        "border rounded-lg",
        "border-white/10", // More subtle border
        "bg-white dark:bg-zinc-950",
      ],
      dots: [
        "relative mx-auto w-full",
        "rounded-lg border border-dashed",
        "border-white/20", // More subtle border
        "px-4 sm:px-6 md:px-8",
      ],
      gradient: ["relative mx-auto w-full", "px-4 sm:px-6 md:px-8"],
      plus: [
        "border border-white/10", // More subtle border, not dashed
        "relative rounded-lg", // Added rounded corners
      ],
      neubrutalism: [
        "border-[0.5px]",
        "border-white/20", // More subtle border
        "relative",
        "shadow-[3px_3px_0px_0px_rgba(255,255,255,0.1)]", // More subtle shadow
        "dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,0.15)]",
      ],
      inner: [
        "border-[0.5px] rounded-md p-2",
        "border-white/15", // More subtle border
        "bg-gray-900/50", // Added darker background
      ],
      lifted: [
        "border rounded-xl",
        "border-white/15", // More subtle border
        "relative",
        "shadow-[0px_3px_0px_0px_rgba(255,255,255,0.1)]", // More subtle shadow
        "dark:shadow-[0px_2px_0px_0px_rgba(255,255,255,0.15)]",
        "bg-zinc-800 dark:bg-zinc-900/50", // Darker background
      ],
      corners: [
        "border rounded-md",
        "border-white/15", // More subtle border
        "relative",
      ],
    },
  },
  defaultVariants: {
    variant: "default",
  },
})

const CardContent = React.forwardRef(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-6", className)} {...props}>
    {props.children}
  </div>
))
CardContent.displayName = "CardContent"

const Card = React.forwardRef(({ className, variant, title, description, children, ...props }, ref) => {
  const DotsPattern = () => {
    const sharedClasses =
      "rounded-full outline outline-8 dark:outline-gray-950 sm:my-6 md:my-8 size-1 my-4 outline-gray-50 bg-green-400"

    return (<>
      <div
        className="absolute left-0 top-4 -z-0 h-px w-full bg-white/60 dark:bg-white/60 sm:top-6 md:top-8" />
      <div
        className="absolute bottom-4 left-0 z-0 h-px w-full bg-white/60 dark:bg-white/60 sm:bottom-6 md:bottom-8" />
      <div className="relative w-full border-x border-white/60 dark:border-white/60">
        <div className="absolute z-0 grid h-full w-full items-center">
          <section
            className="absolute z-0 grid h-full w-full grid-cols-2 place-content-between">
            <div className={`${sharedClasses} -translate-x-[2.5px]`} />
            <div className={`${sharedClasses} translate-x-[2.5px] place-self-end`} />
            <div className={`${sharedClasses} -translate-x-[2.5px]`} />
            <div className={`${sharedClasses} translate-x-[2.5px] place-self-end`} />
          </section>
        </div>

        <div className="relative z-20 mx-auto py-8">
          <CardContent>
            {title && (
              <h3 className="text-lg font-bold mb-1 text-gray-100">
                {title}
              </h3>
            )}
            {description && (
              <p className="text-gray-300">
                {description}
              </p>
            )}
            {children}
          </CardContent>
        </div>
      </div>
    </>);
  }

  const GradientLines = () => (
    <>
      <div
        className="absolute left-0 top-4 -z-0 h-px w-full bg-gradient-to-l from-white/20 via-white/40 to-white/60 sm:top-6 md:top-8" />
      <div
        className="absolute bottom-4 left-0 z-0 h-px w-full bg-gradient-to-r from-white/20 via-white/40 to-white/60 sm:bottom-6 md:bottom-8" />
      <div className="relative w-full border-x border-gradient-x">
        <div
          className="absolute inset-y-0 left-0 w-px bg-gradient-to-t from-white/20 via-white/40 to-white/60" />
        <div
          className="absolute inset-y-0 right-0 w-px bg-gradient-to-t from-white/20 via-white/40 to-white/60" />
        <div className="relative z-20 mx-auto py-8">{content}</div>
      </div>
    </>
  )

  const PlusIcons = () => (
    <>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        width={24}
        height={24}
        strokeWidth="1"
        stroke="currentColor"
        className="text-white/80 size-6 absolute -top-3 -left-3">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m6-6H6" />
      </svg>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        width={24}
        height={24}
        strokeWidth="1"
        stroke="currentColor"
        className="text-white/80 size-6 absolute -top-3 -right-3">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m6-6H6" />
      </svg>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        width={24}
        height={24}
        strokeWidth="1"
        stroke="currentColor"
        className="text-white/80 size-6 absolute -bottom-3 -left-3">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m6-6H6" />
      </svg>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        width={24}
        height={24}
        strokeWidth="1"
        stroke="currentColor"
        className="text-white/80 size-6 absolute -bottom-3 -right-3">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m6-6H6" />
      </svg>
    </>
  )

  const CornerBorders = () => (
    <>
      <div
        className="border-white/70 size-6 absolute -top-0.5 -left-0.5 border-l-2 border-t-2 rounded-tl-md" />
      <div
        className="border-white/70 size-6 absolute -top-0.5 -right-0.5 border-r-2 border-t-2 rounded-tr-md" />
      <div
        className="border-white/70 size-6 absolute -bottom-0.5 -left-0.5 border-l-2 border-b-2 rounded-bl-md" />
      <div
        className="border-white/70 size-6 absolute -bottom-0.5 -right-0.5 border-r-2 border-b-2 rounded-br-md" />
    </>
  )

  const InnerContent = () => {
    if (variant === "dots") return <DotsPattern />;
    if (variant === "gradient") return <GradientLines />;
    if (variant === "plus") return <PlusIcons />;
    if (variant === "corners") return <CornerBorders />;
    return null
  }

  const content = (
    <CardContent>
      {title && (
        <h3 className="text-lg font-bold mb-1 text-gray-100">
          {title}
        </h3>
      )}
      {description && (
        <p className="text-gray-300">{description}</p>
      )}
      {children}
    </CardContent>
  )

  if (variant === "dots") {
    return (
      (<div ref={ref} className={cn(cardVariants({ variant, className }))} {...props}>
        <div
          className="absolute left-0 top-4 -z-0 h-px w-full bg-white/60 dark:bg-white/60 sm:top-6 md:top-8" />
        <div
          className="absolute bottom-4 left-0 z-0 h-px w-full bg-white/60 dark:bg-white/60 sm:bottom-6 md:bottom-8" />
        <div className="relative w-full border-x border-white/60 dark:border-white/60">
          <div className="absolute z-0 grid h-full w-full items-center">
            <section
              className="absolute z-0 grid h-full w-full grid-cols-2 place-content-between">
              <div
                className="rounded-full outline outline-8 dark:outline-gray-950 sm:my-6 md:my-8 size-1 my-4 outline-gray-50 bg-green-400 -translate-x-[2.5px]" />
              <div
                className="rounded-full outline outline-8 dark:outline-gray-950 sm:my-6 md:my-8 size-1 my-4 outline-gray-50 bg-green-400 translate-x-[2.5px] place-self-end" />
              <div
                className="rounded-full outline outline-8 dark:outline-gray-950 sm:my-6 md:my-8 size-1 my-4 outline-gray-50 bg-green-400 -translate-x-[2.5px]" />
              <div
                className="rounded-full outline outline-8 dark:outline-gray-950 sm:my-6 md:my-8 size-1 my-4 outline-gray-50 bg-green-400 translate-x-[2.5px] place-self-end" />
            </section>
          </div>
          <div className="relative z-20 mx-auto py-8">{content}</div>
        </div>
      </div>)
    );
  }

  if (variant === "inner") {
    return (
      (<div ref={ref} className={cn(cardVariants({ variant, className }))} {...props}>
        <div
          className="border rounded-sm bg-gradient-to-br from-gray-800 to-gray-900/60 border-white/50 shadow-[2px_0_8px_rgba(255,255,255,0.05)] dark:shadow-inner">
          {content}
        </div>
      </div>)
    );
  }

  if (variant === "gradient") {
    return (
      (<div ref={ref} className={cn(cardVariants({ variant, className }))} {...props}>
        <GradientLines />
      </div>)
    );
  }

  return (
    (<div ref={ref} className={cn(cardVariants({ variant, className }))} {...props}>
      <InnerContent />
      {content}
    </div>)
  );
})
Card.displayName = "Card"

export { Card, CardContent, cardVariants };
