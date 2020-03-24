import sys
from statistics import median

# apply median filtering and average filtering
def apply_filter(img_matrix, filter_size, filter_type):
    filtered_matrix = img_matrix[:]
    # this value is used to find neighbors
    mid = int(filter_size/2)
    for i in range(mid, len(img_matrix)-mid):
        for j in range(mid, len(img_matrix[0])-mid):
            mid = int(filter_size/2)
            avg = 0
            neighbors = []
            # find neighbors based on filter_size
            for m in range(-mid, mid+1):
                for n in range(-mid, mid+1):
                    neighbors.append(img_matrix[i+m][j+n])
            # apply median or average filtering based on filter_type
            if filter_type == "avg":
                avg = sum(neighbors)/(filter_size*filter_size)
                filtered_matrix[i][j] = avg
            else:
                filtered_matrix[i][j] = median(neighbors)
    return filtered_matrix

# read ppm file
def read_ppm(input):
    with open(input, 'r') as f:
        magic_number = f.readline()
        comment = f.readline()
        size = f.readline().split()
        max_val = f.readline()
        width, height = int(size[0]), int(size[1])
        img_matrix = [[0 for j in range(width)] for i in range(height)]
        for i in range(height):
            pixel_row = f.readline().split()
            for j, pixel in enumerate(pixel_row):
                img_matrix[i][j] = int(pixel)
        return img_matrix

# write ppm file
def write_ppm(output, img_matrix):
    width = len(img_matrix[0])
    height = len(img_matrix)
    with open(output, 'w') as fw:
        fw.write('P2\n')
        fw.write(
            '# Image from: https://homepages.inf.ed.ac.uk/rbf/HIPR2/median.htm\n'
        )
        fw.write('%d %d\n' % (width, height))
        fw.write('255\n')
        for img_row in img_matrix:
            for pixel in img_row:
                fw.write('%d ' % pixel)
            fw.write('\n')

# main function
def main():
    # users should specify 4 arguments
    if len(sys.argv) < 5:
        print('Usage: python %s <input_file> <output_file> <filter_size> <avg or med>' %
              sys.argv[0])
        return
    input_file = sys.argv[1]
    output_file = sys.argv[2]
    filter_size = int(sys.argv[3])
    # median filtering or average filtering
    filter_type = sys.argv[4]
    if (filter_size%2) != 1:
        print("Error: filter_size should be odd")
        return
    img_matrix = read_ppm(input_file)
    flt_matrix = apply_filter(img_matrix, filter_size, filter_type)
    write_ppm(output_file, flt_matrix)


if __name__ == '__main__':
    main()
