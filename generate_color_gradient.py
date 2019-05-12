from colour import Color
from sys import *

def color_gradient(color1, color2, numItems):

	colors = list(Color(color1).range_to(Color(color2),numItems))

	for c in range(0, len(colors)):
		colors[c] = '0x' + colors[c].hex_l[1:]

	return colors

def main(argv):

	color1 = '#fdd043'
	color2 = '#e2598b'
	numItems = 100

	colors = color_gradient(color1, color2, numItems)
	print(colors)

if __name__ == '__main__':
	main(argv)
