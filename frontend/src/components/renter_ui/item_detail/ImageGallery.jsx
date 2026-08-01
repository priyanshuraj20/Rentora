const ImageGallery = ({ image }) => {
  return (
      <div className="rounded-2xl overflow-hidden bg-white">
        <img
          src={image}
          alt="item"
          className="w-full object-contain"
        />
      </div>

  );
};

export default ImageGallery;
