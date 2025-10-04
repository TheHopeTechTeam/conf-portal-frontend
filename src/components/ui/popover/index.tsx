import React, { useEffect, useRef, useState } from "react";

type Position = "top" | "right" | "bottom" | "left";

interface PopoverProps {
  title: React.ReactNode;
  children: React.ReactNode;
  position: Position;
  trigger: React.ReactNode;
}

export default function Popover({ title, children, position, trigger }: PopoverProps) {
  const [isOpen, setIsOpen] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        popoverRef.current &&
        !popoverRef.current.contains(event.target as Node) &&
        triggerRef.current &&
        !triggerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const togglePopover = () => setIsOpen(!isOpen);

  const positionClasses = {
    top: "bottom-full left-1/2 transform -translate-x-1/2 mb-2",
    right: "left-full top-1/2 transform -translate-y-1/2 ml-2",
    bottom: "top-full left-1/2 transform -translate-x-1/2 mt-2",
    left: "right-full top-1/2 transform -translate-y-1/2 mr-2",
  };

  return (
    <div className="relative inline-block">
      <div ref={triggerRef} onClick={togglePopover}>
        {trigger}
      </div>
      {isOpen && (
        <div ref={popoverRef} className={`absolute w-[300px] z-99999 ${positionClasses[position]}`}>
          <div className="w-full bg-white rounded-xl shadow-theme-lg dark:bg-[#1E2634]">
            <div className="relative rounded-t-xl border-b border-gray-200 bg-gray-100 px-5 py-3 dark:border-white/[0.03] dark:bg-[#252D3A]">
              <h3 className="text-base font-semibold text-gray-800 dark:text-white/90">{title}</h3>
            </div>
            {children}
          </div>
        </div>
      )}
    </div>
  );
}
