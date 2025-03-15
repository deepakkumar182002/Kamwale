// "use client";

// import { cn } from "@/lib/utils";
// import ReactTimeago from "react-timeago";

// type Props = {
//   createdAt: Date;
//   className?: string;
// };

// function Timestamp({ createdAt, className }: Props) {
//   return (
//     <ReactTimeago
//       className={cn(
//         "font-medium text-neutral-500 dark:text-neutral-400 text-xs",
//         className
//       )}
//       date={createdAt}
//       formatter={(value, unit, suffix, epochMiliseconds, nextFormatter) => {
//         // Example: if its 7 min, return "7m", if its 7 hours, return "7h" like that
//         if (unit === "second") {
//           return `${value}${unit[0]}`;
//         } else if (unit === "minute") {
//           return `${value}${unit[0]}`;
//         } else if (unit === "hour") {
//           return `${value}${unit[0]}`;
//         } else if (unit === "day") {
//           return `${value}${unit[0]}`;
//         } else if (unit === "week") {
//           return `${value}${unit[0]}`;
//         } else if (unit === "month") {
//           return `${value}${unit[0]}`;
//         } else if (unit === "year") {
//           return `${value}${unit[0]}`;
//         } else {
//           return nextFormatter?.(value, unit, suffix, epochMiliseconds);
//         }
//       }}
//     />
//   );
// }

// export default Timestamp;

"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import ReactTimeago from "react-timeago";

type Props = {
  createdAt: Date;
  className?: string;
};

function Timestamp({ createdAt, className }: Props) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) return null;

  return (
    <ReactTimeago
      className={cn(
        "font-medium text-neutral-500 dark:text-neutral-400 text-xs",
        className
      )}
      date={createdAt}
      formatter={(value, unit, suffix, epochMiliseconds, nextFormatter) => {
        const shorthand = {
          second: "s",
          minute: "m",
          hour: "h",
          day: "d",
          week: "w",
          month: "mo",
          year: "y",
        };

        return `${value}${shorthand[unit] || unit}`;
      }}
    />
  );
}

export default Timestamp;

