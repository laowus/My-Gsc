const getColor = (index) => {
  const colors = ["#FFE3E3", "#FFEFD3", "#FFF6CC", "#E3FFD3", "#D3FFEC", "#D3F6FF", "#D3E3FF", "#F6D3FF"];
  return colors[index % colors.length];
};

export default getColor;
