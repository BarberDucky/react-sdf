export function AddShapeIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" {...props}>
      <title>plus-circle-outline</title>
      <path d="M12,20C7.59,20 4,16.41 4,12C4,7.59 7.59,4 12,4C16.41,4 20,7.59 20,12C20,16.41 16.41,20 12,20M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M13,7H11V11H7V13H11V17H13V13H17V11H13V7Z" />
    </svg>
  )
}

export function SphereIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" {...props}>
      <title>sphere</title>
      <path d="M12 2C6.5 2 2 6.5 2 12C2 17.5 6.5 22 12 22C17.5 22 22 17.5 22 12C22 6.5 17.5 2 12 2M12 14C7.58 14 4 13.11 4 12C4 10.9 7.58 10 12 10S20 10.9 20 12C20 13.11 16.42 14 12 14M12 4C15.37 4 18.25 6.09 19.43 9.05C17.93 8.43 15.61 8 12 8C9.8 8 6.73 8.19 4.57 9.05C5.75 6.09 8.63 4 12 4M12 20C8.63 20 5.75 17.91 4.57 14.95C6.07 15.57 8.39 16 12 16C14.2 16 17.27 15.81 19.43 14.95C18.25 17.91 15.37 20 12 20Z" />
    </svg>
  )
}

export function CubeIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" {...props}>
      <title>cube-outline</title>
      <path d="M21,16.5C21,16.88 20.79,17.21 20.47,17.38L12.57,21.82C12.41,21.94 12.21,22 12,22C11.79,22 11.59,21.94 11.43,21.82L3.53,17.38C3.21,17.21 3,16.88 3,16.5V7.5C3,7.12 3.21,6.79 3.53,6.62L11.43,2.18C11.59,2.06 11.79,2 12,2C12.21,2 12.41,2.06 12.57,2.18L20.47,6.62C20.79,6.79 21,7.12 21,7.5V16.5M12,4.15L6.04,7.5L12,10.85L17.96,7.5L12,4.15M5,15.91L11,19.29V12.58L5,9.21V15.91M19,15.91V9.21L13,12.58V19.29L19,15.91Z" />
    </svg>
  )
}

export function ConeIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" {...props}>
      <title>cone</title>
      <path d="M21.62 16.68H21.62L12.85 2.5C12.66 2.16 12.33 2 12 2C11.67 2 11.34 2.16 11.15 2.47L2.38 16.65H2.4C2.15 17.04 2 17.5 2 18C2 19.5 3.3 22 12 22C15.74 22 22 21.5 22 18C22 17.61 21.91 17.15 21.62 16.68M12 4.9L18 14.58C16.53 14.23 14.6 14 12 14C10.25 14 7.96 14.12 6 14.6L12 4.9M12 20C7.58 20 4 19.11 4 18C4 16.9 7.58 16 12 16S20 16.9 20 18C20 19.11 16.42 20 12 20Z" />
    </svg>
  )
}

export type ShapeIconType =
  | typeof SphereIcon
  | typeof CubeIcon
  | typeof ConeIcon