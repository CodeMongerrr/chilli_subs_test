export async function getServerSideProps() {
  const res = await fetch("http://localhost:3000/api/publications");
  const publications = await res.json();

  return { props: { publications } };
}

export default function Publications({ publications }: any) {
  return (
    <div>
      {publications.map((p: any) => (
        <a key={p.id} href={`/publications/${p.id}`}>
          {p.name}
        </a>
      ))}
    </div>
  );
}
