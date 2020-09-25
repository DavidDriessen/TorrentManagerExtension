export default function(num: number) {
  // jacked from: https://github.com/sindresorhus/pretty-bytes
  if (isNaN(num)) {
    return num;
  }

  const neg = num < 0;
  const units = ["B", "kB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];

  if (neg) {
    num = -num;
  }

  if (num < 1) {
    return (neg ? "-" : "") + num + " B";
  }

  const exponent = Math.min(
    Math.floor(Math.log(num) / Math.log(1000)),
    units.length - 1
  );
  num = num / Math.pow(1000, exponent);
  // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
  // @ts-ignore
  num = num.toFixed(2) * 1;

  return (neg ? "-" : "") + num + " " + units[exponent];
}
