---
comments: true
---

# Image Classification

## Intro

### Introduction
Image classification is the task of assigning an input image one label from a fixed set of categories. This is one of the core problems in Computer Vision that, despite its simplicity, has a large variety of practical applications.

### Problems 

-  Semantic Gap: the gap between low-level visual features and high-level concepts.For
a particular image, what computer sees is just a big grid of numbers, and it has no idea what the image is about.


- Viewpoint variation: A single instance of an object can be oriented in many ways with respect to the camera.When the Camera is moves,all the pixels in the image will change.

- Intra-class variation: Objects of the same class can look quite different in terms of their appearance.

<div align="center">
    <img src="../img/lec1-1.png" width="50%">
</div>

- Fine-Grained Categories: Distinguishing between different fine-grained categories, such as dog breeds.

<div align="center">
    <img src="../img/lec1-2.png" width="50%">
</div>

- Background clutter: The presence of other objects in the scene.

<div align="center">
    <img src="../img/lec1-3.png" width="50%">
</div>


- Illumination: The effects of illumination on the pixel values of the image.

<div align="center">
    <img src="../img/lec1-4.png" width="50%">
</div>

- Deformation: Objects can change shape.

<div align="center">
    <img src="../img/lec1-6.png" width="50%">
</div>

- Occlusion: Objects can be occluded.

<div align="center">
    <img src="../img/lec1-5.png" width="50%">
</div>


图像分类十分有用，例如可以用来做图片字幕

<div align="center">
    <img src="../img/lec1-7.png" width="50%">
</div>

依次识别背景的蓝天，人物，马，海滩等等，可以组成一个句子“a person riding a horse on the beach under the blue sky”。

还可以用来识别棋盘然后下棋......

A Image Classifier may look like this:

```python
def classify_image(image):
    # Some magic here
    return class_label
```

Unlike sorting a list of numbers,there is no obvious way to hard-code the algorithm for recognizing objects in images.

Machine Learning is a Data-Driven Approach.

1. Collect a dataset of images and labels.
- Use Machine Learning to train a classifier.
- Evaluate the classifier on a new image.


Eg.MNIST is a dataset of handwritten digits.

- 10 classes (one for each of the 10 digits).
- 00,000 training images and 10,000 test images.
- Regarded as the "Drosophila" of Computer Vision.


EG.CIFAR-10 is another popular dataset.
This dataset consists of 60,000 tiny images that are 32 pixels high and wide. Each image is labeled with one of 10 classes (for example “airplane, automobile, bird, etc”). These 60,000 images are partitioned into a training set of 50,000 images and a test set of 10,000 images


## Nearest Neighbor

```python
def train(images, labels):
    # machine learning
    return model
```

```python
def predict(model, test_images):
    # use model to predict labels
    return test_labels
```

Distance Metric to compare images

### L1 distance

\[
   d_1(I_1, I_2) = \sum_p |I_1^p - I_2^p|
\]


即对于每个像素点，计算两个图像对应像素点的差的绝对值，然后求和。

例如

<div align="center">
    <img src="../img/lec1-8.png" width="50%">
</div>

例如，对于CIFAR-10数据集；

```python
Xtr, Ytr, Xte, Yte = load_CIFAR10('data/cifar10/') # a magic function we provide
# flatten out all images to be one-dimensional
Xtr_rows = Xtr.reshape(Xtr.shape[0], 32 * 32 * 3) # Xtr_rows becomes 50000 x 3072
Xte_rows = Xte.reshape(Xte.shape[0], 32 * 32 * 3) # Xte_rows becomes 10000 x 3072
```
其中`Xtr,Xte`是训练集和测试集，`Ytr,Yte`是对应的标签。载入后将其拉伸为行

```python
nn = NearestNeighbor() # create a Nearest Neighbor classifier class
nn.train(Xtr_rows, Ytr) # train the classifier on the training images and labels
Yte_predict = nn.predict(Xte_rows) # predict labels on the test images
# and now print the classification accuracy, which is the average number
# of examples that are correctly predicted (i.e. label matches)
print 'accuracy: %f' % ( np.mean(Yte_predict == Yte) )
```

```python
import numpy as np

class NearestNeighbor(object):
  def __init__(self):
    pass

  def train(self, X, y):
    """ X is N x D where each row is an example. Y is 1-dimension of size N """
    # the nearest neighbor classifier simply remembers all the training data
    self.Xtr = X
    self.ytr = y

  def predict(self, X):
    """ X is N x D where each row is an example we wish to predict label for """
    num_test = X.shape[0]
    # lets make sure that the output type matches the input type
    Ypred = np.zeros(num_test, dtype = self.ytr.dtype)

    # loop over all test rows
    for i in range(num_test):
      # find the nearest training image to the i'th test image
      # using the L1 distance (sum of absolute value differences)
      distances = np.sum(np.abs(self.Xtr - X[i,:]), axis = 1)
      min_index = np.argmin(distances) # get the index with smallest distance
      Ypred[i] = self.ytr[min_index] # predict the label of the nearest example

    return Ypred
```

### L2 distance

 There are many other ways of computing distances between vectors. Another common choice could be to instead use the L2 distance, which has the geometric interpretation of computing the euclidean distance between two vectors. The distance takes the form:

\[
d_2(I_1, I_2) = \sqrt{\sum_p (I_1^p - I_2^p)^2}
\]

即对于每个像素点，计算两个图像对应像素点的差的平方，然后求和，最后开根号。

```python
distances = np.sqrt(np.sum(np.square(self.Xtr - X[i,:]), axis = 1))
```

在实际上的效果上，由于sqrt函数是单调递增的，即使不使用sqrt函数，也不会影响最终的结果。

!!!info "L1 vs L2"
    1. L2距离的平方项意味着它对大差异非常敏感。例如，如果在某一维度上两个向量的差异很大，那么L2距离会显著增加。L2距离不喜欢大差异，认为大差异是很不理想的。换句话说，L2距离更“惩罚”大的误差，因为它把误差平方了。所以即使有一个维度的差异很大，L2距离也会显著增大整体距离。

    - L1距离对小差异更“宽容”：L1距离对差异的惩罚是线性的，即每个维度的差异直接相加。如果一个维度的差异特别大，它对整体距离的影响和L2距离相比就会小很多。因此，L1距离对于大的差异“宽容”一些。在某些情况下，L1距离更适用于忽略一些较小的误差，关注更明显的差异。

    - L2距离的敏感性意味着它会倾向于较小的、均匀的差异，而不太容易接受某一维度上的大差异。比如，如果两个向量在多个维度上有些许的差异，那么L2距离会认为这些小差异比一个大的差异更为“平滑”。
    
    - 换句话说，L2距离在多个维度上拥有较小差异时，它会显示出较小的距离，即使某些维度的差异可能不那么显著；但如果某一维度的差异特别大，L2距离会非常敏感。

    - L1距离和L2距离其实是 p-norm 的两个特殊情况。p-norm的形式是：

    \[
    ||\mathbf{v}||_p = \left( \sum_{i=1}^{n} |v_i|^p \right)^{1/p}
    \]

    其中，p=1 时就是 L1 范数，p=2 时就是 L2 范数。
    
    - 这两者是最常用的p-norm度量，它们被广泛应用于机器学习、优化、图像处理等领域。

### K-Nearest Neighbor

K-Nearest Neighbor (KNN) is a simple idea: when you want to classify an example, you compare it to all examples in your training set. Then you find the most similar examples (the nearest neighbors) and classify your example based on the majority class among the K-nearest neighbors.(Find the top k nearest neighbors and have them vote on the label)

On the figure below,points are training data, and the colors are their labels.

<div align="center">
    <img src="../img/lec1-9.png" width="80%">
</div>

>An example of the difference between Nearest Neighbor and a 5-Nearest Neighbor classifier, using 2-dimensional points and 3 classes (red, blue, green). The colored regions show the decision boundaries induced by the classifier with an L2 distance. The white regions show points that are ambiguously classified (i.e. class votes are tied for at least two classes). Notice that in the case of a NN classifier, outlier datapoints (e.g. green point in the middle of a cloud of blue points) create small islands of likely incorrect predictions, while the 5-NN classifier smooths over these irregularities, likely leading to better generalization on the test data (not shown). Also note that the gray regions in the 5-NN image are caused by ties in the votes among the nearest neighbors (e.g. 2 neighbors are red, next two neighbors are blue, last neighbor is green).

K-NN 方法固然很好，但是我们需要考虑K取什么值是最好的

像K-NN算法中的K这样一开始无法确定的参数，我们称之为超参数(Hyperparameters)。超参数是在开始学习过程之前设置的参数，并且不断调整来取得更好的效果。在这里，K和距离度量（L1或L2）就是超参数。



### Ideas of setting hyperparameters

- Choose hyperparameters that work best on the data(BAD IDEA: K = 1 always works
perfectly on training data)


- Split the data into training,and test sets(BAD IDEA:No idea how algorithm
will perform on new data)

- Spit the data into training,validation,and test sets(GOOD IDEA:Use validation set to tune hyperparameters)

Eg.
```python
# assume we have Xtr_rows, Ytr, Xte_rows, Yte as before
# recall Xtr_rows is 50,000 x 3072 matrix
Xval_rows = Xtr_rows[:1000, :] # take first 1000 for validation
Yval = Ytr[:1000]
Xtr_rows = Xtr_rows[1000:, :] # keep last 49,000 for train
Ytr = Ytr[1000:]

# find hyperparameters that work best on the validation set
validation_accuracies = []
for k in [1, 3, 5, 10, 20, 50, 100]:

  # use a particular value of k and evaluation on validation data
  nn = NearestNeighbor()
  nn.train(Xtr_rows, Ytr)
  # here we assume a modified NearestNeighbor class that can take a k as input
  Yval_predict = nn.predict(Xval_rows, k = k)
  acc = np.mean(Yval_predict == Yval)
  print 'accuracy: %f' % (acc,)

  # keep track of what works on the validation set
  validation_accuracies.append((k, acc))
```


- Cross-validation: Split the data into folds, and average the performance across folds.

<div align="center">
    <img src="../img/lec1-10.png" width="80%">
</div>

Useful for small datasets, but (unfortunately) not used too frequently in deep learning

### Pros and Cons of K-NN

- Pros: Simple to understand, fast to train, easy to add more data.
- Cons: Slow to predict, not good for high-dimensional data, sensitive to irrelevant features.

The Nearest Neighbor Classifier may sometimes be a good choice in some settings (especially if the data is low-dimensional), but it is rarely appropriate for use in practical image classification settings.

One problem is that images are high-dimensional objects (i.e. they often contain many pixels), and distances over high-dimensional spaces can be very counter-intuitive. The image below illustrates the point that the pixel-based L2 similarities we developed above are very different from perceptual similarities:

<div align="center">
    <img src="../img/lec1-11.png" width="80%">
</div>
>高维数据（尤其是图像）的基于像素的距离可能非常不直观。已张原始图像（左）和旁边的其他三张图像，根据 L2 像素距离，它们都与它相距相等。显然，像素距离根本不对应于感知或语义相似性。

One more Example：

可以使用一种称为 t-SNE 的可视化技术来获取 CIFAR-10 图像并将它们嵌入到二维空间中，以便最好地保留它们的（局部）成对距离。在此可视化中，根据我们上面的 L2 像素距离，附近显示的图像被视为非常近：

<div align="center">
    <img src="../img/lec1-12.png" width="80%">
</div>
>CIFAR-10 images embedded in two dimensions with t-SNE. Images that are nearby on this image are considered to be close based on the L2 pixel distance. Notice the strong effect of background rather than semantic class differences. Click [here](https://cs231n.github.io/assets/pixels_embed_cifar10_big.jpg) for a bigger version of this visualization.


在以上的方法中，训练时间很短，但是预测时间很长，因为每次预测都需要计算所有的训练数据。而在实际应用中，我们期望的是即使训练时间长，也要预测时间短的模型。
