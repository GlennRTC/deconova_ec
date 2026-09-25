export default function Disponibilidad({ disponible }: { disponible: boolean }) {
  return (
    <p className={`label disponibilidad${disponible ? " disponible" : ""}`} data-testid="disponibilidad">
      {disponible ? "Disponible" : "Bajo pedido"}
    </p>
  );
}
