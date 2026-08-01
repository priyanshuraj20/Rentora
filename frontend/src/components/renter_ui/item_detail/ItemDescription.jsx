const ItemDescription = ({ description }) => {
  return (
    <section className="mt-10">
      <h3 className="font-bold mb-3">Description</h3>
      <p className="text-sm text-text-secondary leading-relaxed">
        {description}
      </p>
    </section>
  );
};

export default ItemDescription;
