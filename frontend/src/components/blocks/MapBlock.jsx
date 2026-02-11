const MapBlock = ({
  address = '',
  lat = '',
  lng = '',
  zoom = 15,
  height = '400px',
  caption = '',
}) => {
  const getMapUrl = () => {
    if (lat && lng) {
      // Use coordinates if provided
      return `https://www.google.com/maps/embed/v1/place?key=YOUR_API_KEY&q=${lat},${lng}&zoom=${zoom}`;
    } else if (address) {
      // Use address if coordinates not provided
      const encodedAddress = encodeURIComponent(address);
      return `https://www.google.com/maps?q=${encodedAddress}&output=embed&zoom=${zoom}`;
    }
    return '';
  };

  const mapUrl = getMapUrl();

  if (!mapUrl) {
    return (
      <div className="my-6 p-8 bg-gray-100 rounded-lg text-center text-gray-500">
        <p>Alamat atau koordinat tidak valid</p>
        <p className="text-sm mt-2">Masukkan alamat atau koordinat (latitude & longitude)</p>
      </div>
    );
  }

  return (
    <div className="my-6">
      <div className="relative w-full rounded-lg overflow-hidden border border-gray-200" style={{ height }}>
        <iframe
          src={mapUrl}
          title="Google Maps"
          className="absolute inset-0 w-full h-full"
          frameBorder="0"
          style={{ border: 0 }}
          allowFullScreen
          aria-hidden="false"
          tabIndex="0"
        />
      </div>
      {caption && (
        <p className="text-sm text-gray-600 text-center mt-2">{caption}</p>
      )}
    </div>
  );
};

export default MapBlock;
